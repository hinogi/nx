import type { Tree } from '@nrwl/devkit';
import {
  formatFiles,
  normalizePath,
  readProjectConfiguration,
} from '@nrwl/devkit';
import componentGenerator from '../component/component';
import { exportScam } from '../utils/export-scam';
import { getComponentFileInfo } from '../utils/file-info';
import { pathStartsWith } from '../utils/path';
import { convertComponentToScam, normalizeOptions } from './lib';
import type { Schema } from './schema';

export async function scamGenerator(tree: Tree, rawOptions: Schema) {
  const options = normalizeOptions(tree, rawOptions);
  const { inlineScam, projectSourceRoot, ...schematicOptions } = options;

  checkPathUnderProjectRoot(tree, options);

  await componentGenerator(tree, {
    ...schematicOptions,
    skipImport: true,
    export: false,
    standalone: false,
  });

  const componentFileInfo = getComponentFileInfo(tree, options);
  convertComponentToScam(tree, componentFileInfo, options);
  exportScam(tree, componentFileInfo, options);

  await formatFiles(tree);
}

function checkPathUnderProjectRoot(tree: Tree, options: Partial<Schema>) {
  if (!options.path) {
    return;
  }

  const { root } = readProjectConfiguration(tree, options.project);

  let pathToComponent = normalizePath(options.path);
  pathToComponent = pathToComponent.startsWith('/')
    ? pathToComponent.slice(1)
    : pathToComponent;

  if (!pathStartsWith(pathToComponent, root)) {
    throw new Error(
      `The path provided for the SCAM (${options.path}) does not exist under the project root (${root}).`
    );
  }
}

export default scamGenerator;
