import antfu from '@antfu/eslint-config'

const rules = {
  'no-console': 'off',
  'vue/block-order':['error', {
    order: [['template', 'script'], 'style'],
  }]
}
const  stylistic = {
  overrides: {
    '@stylistic/no-multiple-empty-lines': 'off',
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }], // 大括号换行风格
    'curly': ['error', 'multi-line', 'consistent'], // 保留大括号
  },
};
export default antfu({
  rules,
  stylistic
})
