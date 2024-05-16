import { colord } from 'colord';

export function getTextColorFromBackground( backgroundColor: string ): string {
	return colord( backgroundColor ).isLight() ? '#000' : '#fff';
}
