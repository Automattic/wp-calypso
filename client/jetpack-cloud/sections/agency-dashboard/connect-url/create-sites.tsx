import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Spinner from './spinner';

export interface Site {
	url: string;
	status: 'pending' | 'success' | 'error';
}

export default function CreateSites( { processed, queue }: { processed: Site[]; queue: Site[] } ) {
	const translate = useTranslate();

	return (
		<div className="connect-url__create-sites">
			<div className="connect-url__create-sites-quantity">
				{ translate( 'Adding {{strong}}%(num)d sites{{/strong}}:', {
					args: { num: processed.length + queue.length },
					components: { strong: <strong /> },
				} ) }
			</div>
			<ul className="connect-url__create-sites-list">
				{ processed.map( ( site, index ) => (
					<li className="connect-url__create-sites-row" key={ index }>
						<Gridicon icon={ site.status === 'success' ? 'checkmark-circle' : 'cross-circle' } />
						<div>{ site.url }</div>
					</li>
				) ) }
				{ queue.map( ( site, index ) => (
					<li className="connect-url__create-sites-row" key={ index }>
						<Spinner />
						<div>{ site.url }</div>
					</li>
				) ) }
			</ul>
		</div>
	);
}
