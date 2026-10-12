import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
	stylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: true,
		jsx: true,
		pluginName: 'stylistic',
	}),
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser },
	},
	...tseslint.configs.recommended,
	{
		files: ['**/*.vue'],
		extends: [pluginVue.configs['flat/essential']],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
			},
		},
	},
	{
		files: ['**/*.css'],
		plugins: { css },
		language: 'css/css',
		extends: ['css/recommended'],
	},
]);
