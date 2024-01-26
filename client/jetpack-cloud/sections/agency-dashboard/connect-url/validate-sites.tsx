import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Spinner from './spinner';

export default function ValidateSites( {
	detectedSites,
	urlColumnIndex,
}: {
	detectedSites: string[];
	urColumnIndex: number;
} ) {
	const translate = useTranslate();

	const domainList = detectedSites.map( ( site: string ) => (
		<div className="connect-url__validate-sites-row" key={ site }>
			<Spinner />
			<div>{ site.split( ',' )[ urlColumnIndex ] }</div>
		</div>
	) );

	return (
		<div className="connect-url__validate-sites">
			<div className="connect-url__validate-sites-quantity">
				{ translate( 'Adding {{strong}}%(num)d sites{{/strong}}', {
					args: { num: detectedSites.length },
					components: { strong: <strong /> },
				} ) }
			</div>
			<div>{ domainList }</div>
			<Button disabled={ true }>{ translate( 'Adding sites' ) }</Button>
		</div>
	);
}
