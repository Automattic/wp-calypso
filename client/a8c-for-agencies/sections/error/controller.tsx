import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import ErrorPage from './primary';
import type { Callback } from '@automattic/calypso-router';

import 'calypso/a8c-for-agencies/style.scss';

export const errorContext: Callback = ( context, next ) => {
	context.layout = (
		<CalypsoI18nProvider i18n={ context.i18n }>
			<ReduxProvider store={ context.store }>
				<ErrorPage querystring={ context.querystring } />
			</ReduxProvider>
		</CalypsoI18nProvider>
	);
	next();
};
