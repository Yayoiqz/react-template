module.exports={
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true
  },
  extends: [
    'airbnb'
  ],
  globals: {
    $: true,
    process: true,
    __dirname: true
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  settings: {
    "import/resolver": {
      webpack: {
        config: './build/webpack.base.conf.js'  // 指定webpack配置文件
      }
    }
  },
  rules: {
    "no-console": 0, //不禁用console
    "semi": [2, "never"],
    "no-irregular-whitespace": 0, //不规则的空白不允许
    "react/jsx-filename-extension": [1, {"extensions": [".js", ".jsx"]}],//文件是.js还是.jsx
    "no-underscore-dangle": 0,
    "array-bracket-spacing": [2, 'never'], // 指定数组的元素之间要以空格隔开(,后面)
    "comma-dangle": 2, // 数组和对象键值对最后一个逗号， never参数：不能带末尾的逗号, always参数：必须带末尾的逗号
    "import/no-extraneous-dependencies": 0,
    "no-restricted-syntax": 0
  }
}
