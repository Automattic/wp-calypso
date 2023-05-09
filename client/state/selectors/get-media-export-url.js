import { get } from 'lodash';

import 'calypso/state/exporter/init';

export default ( state ) => get( state, 'exporter.mediaExportUrl', null );
