import { Default } from './default';
import { JetpackLogo as Legacy } from './legacy';
import { Mark } from './mark';

export const JetpackLogo = Object.assign( Legacy, {
	Default: Object.assign( Default, {
		displayName: 'JetpackLogo.Default',
	} ),
	Mark: Object.assign( Mark, {
		displayName: 'JetpackLogo.Mark',
	} ),
} );
