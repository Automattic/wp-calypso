import { Importer } from './types';

export const getImporterTypeForEngine = ( engine: Importer ) => `importer-type-${ engine }`;
