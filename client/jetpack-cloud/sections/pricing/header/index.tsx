import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const Header: React.FC< Props > = ( { title } ) => {
	const translate = useTranslate();

	return (
		<>
			<div className="header">
				<FormattedHeader
					className="header__main-title"
					headerText={ preventWidows(
						title ?? translate( 'Security, performance, and marketing tools made for WordPress' )
					) }
					align="center"
				/>
			</div>
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
	title?: string;
};

export default Header;
