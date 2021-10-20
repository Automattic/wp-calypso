import { createElement } from 'react';
import Licenses from './main';

export function licenses( context: PageJS.Context, next: () => void ): void {
	context.primary = createElement( Licenses );
	next();
}
