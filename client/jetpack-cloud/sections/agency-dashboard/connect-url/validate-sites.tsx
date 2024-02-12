import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Spinner from './spinner';

export interface Site {
	url: string;
}

export default function ValidateSites( {
	processed,
	queue,
}: {
	processed: Site[];
	queue: Site[];
} ) {
	const translate = useTranslate();

	return (
		<div className="connect-url__validate-sites">
			<div className="connect-url__validate-sites-quantity">
				{ translate( 'Adding {{strong}}%(num)d sites{{/strong}}', {
					args: { num: queue.length },
					components: { strong: <strong /> },
				} ) }
			</div>
			<div>
				{ processed.map( ( site, index ) => (
					<div className="connect-url__validate-sites-row" key={ index }>
						<Gridicon icon="gridicons-checkmark-circle" />
						<div>{ site.url }</div>
					</div>
				) ) }
				{ queue.map( ( site, index ) => (
					<div className="connect-url__validate-sites-row" key={ index }>
						<Spinner />
						<div>{ site.url }</div>
					</div>
				) ) }
			</div>
			<Button disabled={ true }>{ translate( 'Adding sites' ) }</Button>
		</div>
	);
}
