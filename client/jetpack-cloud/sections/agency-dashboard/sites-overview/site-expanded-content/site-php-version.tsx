import { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

export default function SitePhpVersion( {
	phpVersion,
}: {
	phpVersion: number | null;
} ): JSX.Element | null {
	const translate = useTranslate();

	if ( ! phpVersion ) {
		return null;
	}

	return (
		<div className="site-expanded-content__php-version">
			{ translate( 'PHP Version' ) }&nbsp;
			{ phpVersion }
		</div>
	);
}
