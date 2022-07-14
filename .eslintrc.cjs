module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["standard"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    semi: [2, "always"],
    quotes: ["error", "double"],
    "comma-dangle": ["error", "only-multiline"],
    "no-undef": 0,
    "no-fallthrough": 0,
  },
};
