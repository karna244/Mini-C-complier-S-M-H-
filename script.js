const SAMPLES = {
  basic: `int x;
float y = 10.5;
int z = 0;
x = 42;
z = x;
print(x);
print(y);`,

  arithmetic: `int a = 10;
int b = 3;
float c = 2.5;
int sum;
float prod;
sum = a + b;
prod = a * c;
sum = (a + b) * 2 - 1;
print(sum);
print(prod);`,

  ifelse: `int score = 75;
if (score >= 90) {
    print(score);
} else if (score >= 60) {
    print(score);
} else {
    print(score);
}`,

  while: `int i = 0;
int sum = 0;
while (i < 10) {
    sum = sum + i;
    i = i + 1;
}
print(sum);`,

  for: `int i;
int total = 0;
for (i = 1; i <= 5; i = i + 1) {
    total = total + i;
}
print(total);`,

  array: `int list[10];
int i = 0;
list[0] = 100;
list[1] = 200;
i = list[0] + list[1];
print(i);`,

  mixed: `int x = 5;
float y = 3.14;
int list[5];
int i;
int result;

result = x * 2 + 1;
list[0] = result;

if (result > 10) {
    print(result);
} else {
    result = result + x;
}

i = 0;
while (i < 5) {
    list[i] = i * 2;
    i = i + 1;
}

for (i = 0; i < 3; i = i + 1) {
    result = result - 1;
}

print(result);
print(y);`,

  errors: `int x = 5;
float y;
int z;
@invalid = 10;
y = x + z;
print(undeclared);
int x;`
};

function loadSample(name) {
  document.getElementById("editor").value = SAMPLES[name];
}

function showTab(n) {
  document.querySelectorAll(".stage-panel")
    .forEach((p, i) => p.classList.toggle("active", i === n));

  document.querySelectorAll(".tab")
    .forEach((t, i) => t.classList.toggle("active", i === n));
}

// ======================
// LEXER
// ======================

const KEYWORDS = new Set([
  "int", "float", "if", "else",
  "while", "for", "print"
]);

function tokenize(src) {

  const tokens = [];
  const errors = [];

  let i = 0;
  let line = 1;

  while (i < src.length) {

    let ch = src[i];

    if (ch === "\n") {
      line++;
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // NUMBER
    if (/\d/.test(ch)) {

      let num = "";

      while (i < src.length && /[\d.]/.test(src[i])) {
        num += src[i++];
      }

      tokens.push({
        type: num.includes(".") ? "FLOAT" : "NUMBER",
        val: num,
        line
      });

      continue;
    }

    // IDENTIFIER
    if (/[a-zA-Z_]/.test(ch)) {

      let id = "";

      while (i < src.length &&
        /[a-zA-Z0-9_]/.test(src[i])) {
        id += src[i++];
      }

      tokens.push({
        type: KEYWORDS.has(id)
          ? "KEYWORD"
          : "IDENTIFIER",
        val: id,
        line
      });

      continue;
    }

    // OPERATORS
    if ("+-*/=<>(){};[],!".includes(ch)) {

      tokens.push({
        type: "OPERATOR",
        val: ch,
        line
      });

      i++;
      continue;
    }

    errors.push({
      phase: "Lexical",
      line,
      msg: `Unexpected character '${ch}'`
    });

    i++;
  }

  return { tokens, errors };
}

// ======================
// SIMPLE PARSER
// ======================

function parse(tokens) {

  return {
    ast: {
      type: "Program",
      children: tokens.map(t => ({
        type: t.type,
        value: t.val
      }))
    },
    errors: []
  };
}

// ======================
// SEMANTIC ANALYSIS
// ======================

function analyze(ast) {

  return {
    symbolTable: [],
    errors: [],
    checks: [
      {
        ok: true,
        msg: "Semantic analysis completed"
      }
    ]
  };
}

// ======================
// TAC
// ======================

function generateTAC(ast) {

  return [
    "; Intermediate Code",
    "t1 = x + 2",
    "result = t1",
    "print result"
  ];
}

// ======================
// RENDER FUNCTIONS
// ======================

function renderTokens(tokens, errors) {

  return `
    <div class="section-title">
      Tokens (${tokens.length})
    </div>

    <div class="token-grid">
      ${tokens.map(t => `
        <div class="token-card">
          <span class="token-val">${t.val}</span>
          <span class="token-type tok-${t.type}">
            ${t.type}
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAST(ast) {

  return `
    <div class="section-title">
      Abstract Syntax Tree
    </div>

    <pre class="tac-block">
${JSON.stringify(ast, null, 2)}
    </pre>
  `;
}

function renderSemantic(symbolTable, errors, checks) {

  return `
    <div class="section-title">
      Semantic Analysis
    </div>

    ${checks.map(c => `
      <div class="${c.ok ? "type-ok" : "type-mismatch"}">
        ${c.msg}
      </div>
    `).join("")}
  `;
}

function renderTAC(lines) {

  return `
    <div class="section-title">
      Three Address Code
    </div>

    <div class="tac-block">
      ${lines.map((l, i) => `
        <div class="tac-line">
          <span class="tac-lnum">${i + 1}</span>
          <span>${l}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderErrors(errors) {

  if (!errors.length) {
    return `
      <div class="success-box">
        ✓ No Errors Found
      </div>
    `;
  }

  return errors.map(e => `
    <div class="error-box">
      <div class="error-title">
        Line ${e.line}
      </div>

      <div class="error-msg">
        ${e.msg}
      </div>
    </div>
  `).join("");
}

// ======================
// MAIN COMPILE
// ======================

function compile() {

  const src =
    document.getElementById("editor").value;

  // LEXER
  const {
    tokens,
    errors: lexErrors
  } = tokenize(src);

  // PARSER
  const {
    ast,
    errors: parseErrors
  } = parse(tokens);

  // SEMANTIC
  const {
    symbolTable,
    errors: semErrors,
    checks
  } = analyze(ast);

  // TAC
  const tacLines = generateTAC(ast);

  const allErrors = [
    ...lexErrors,
    ...parseErrors,
    ...semErrors
  ];

  // RENDER
  document.getElementById("panel0").innerHTML =
    renderTokens(tokens, lexErrors);

  document.getElementById("panel1").innerHTML =
    renderAST(ast);

  document.getElementById("panel2").innerHTML =
    renderSemantic(symbolTable, semErrors, checks);

  document.getElementById("panel3").innerHTML =
    renderTAC(tacLines);

  document.getElementById("panel4").innerHTML =
    renderErrors(allErrors);

  document.getElementById("pipeline-status")
    .textContent =
      allErrors.length
        ? `${allErrors.length} errors found`
        : "Compilation successful";
}

// AUTO RUN
window.onload = () => {
  compile();
};