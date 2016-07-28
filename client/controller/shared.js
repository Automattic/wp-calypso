import { setSection as setSectionAction } from 'state/ui/actions';
import noop from 'lodash/noop';

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	};
}
