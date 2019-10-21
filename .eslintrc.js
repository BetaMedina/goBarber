module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier'
  ],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "prettier/prettier": "error",
    "linebreak-style": 0, //Tamanho da quebra de linha
    "class-methods-use-this": "off",//permite usar metodos sem o THIS dentro da classe
    "no-param-reassign": "off", //trava a lteração de parametros
    "camelcase": "off", //Não exige o camelCase
    "no-unused-vars": ["error", { "argsIgnorePattern": "next" }] //Ignora caso o 'next' esteja sendo passado e não usado
  },
};
