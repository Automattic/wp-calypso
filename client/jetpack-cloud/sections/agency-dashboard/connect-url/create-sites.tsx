import { Gridicon, ProgressBar } from '@automattic/components';
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
			{ processed.length === processed.length + queue.length ? (
				<>
					<div className="connect-url__create-sites-quantity">
						{ translate( 'Adding {{strong}}%(num)d sites{{/strong}}:', {
							args: { num: processed.length + queue.length },
							components: { strong: <strong /> },
						} ) }
					</div>
					<ul className="connect-url__create-sites-list">
						{ processed.map( ( site, index ) => (
							<li className="connect-url__create-sites-row" key={ index }>
								<Gridicon
									icon={ site.status === 'success' ? 'checkmark-circle' : 'cross-circle' }
								/>
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
				</>
			) : (
				<div className="connect-url__create-sites-progress">
					<h3 className="connect-url__create-sites-progress-title">
						{ translate( 'Adding sites' ) }
					</h3>
					<span className="connect-url__create-sites-progress-subtitle">
						{ translate( 'Please wait while we add all sites to your account.' ) }
					</span>
					<ProgressBar
						value={ processed.length }
						total={ processed.length + queue.length }
						color="var(--studio-jetpack-green-50)"
					/>
				</div>
			) }
		</div>
	);
}
