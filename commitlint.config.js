const { readdirSync } = require('fs');

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const scopes = [];
for (const path of getDirectories('./src').map((p) => `./src/${p}`)) {
  const files = readdirSync(path, { withFileTypes: true });
  scopes.push(...files.filter((item) => item.isDirectory()).map((item) => item.name));
}

scopes.push(
  'remove', // Remove files
  'revert', // Revert changes
  'conflict', // Conflict resolution
  'config', // Configuration changes
  'entity', // Entity changes
  'utils', // Utility functions
  'deps', // Dependency changes
  'modules',
  'test',
  'migration',
  'core',
  'docs', // Documentation changes
  'ci', // CI/CD related changes
  'build', // Build system changes
  'style', // Code style/formatting changes
  'perf', // Performance improvements
  'security' // Security-related changes
);

module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message) => message.includes('release')],
  rules: {
    'scope-enum': [2, 'always', scopes]
  }
};
