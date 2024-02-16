import { Gridicon, ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export interface Site {
	url: string;
	status: 'pending' | 'success' | 'error';
}

export default function CreateSites( { processed, queue }: { processed: Site[]; queue: Site[] } ) {
	const translate = useTranslate();

	const successfull = processed.filter( ( site ) => site.status === 'success' );
	const unsucessfull = processed.filter( ( site ) => site.status !== 'success' );

	return (
		<div className="connect-url__create-sites">
			{ processed.length === processed.length + queue.length ? (
				<div className="connect-url__create-sites-list">
					<div className="connect-url__create-sites-list-successful">
						<div className="connect-url__create-sites-quantity">
							{ translate( 'Successfully added {{strong}}%(num)d sites{{/strong}}:', {
								args: { num: successfull.length },
								components: { strong: <strong /> },
							} ) }
						</div>
						<ul>
							{ successfull.map( ( site, index ) => (
								<li className="connect-url__create-sites-row" key={ index }>
									<Gridicon icon="checkmark-circle" />
									<div>{ site.url }</div>
								</li>
							) ) }
						</ul>
					</div>
					<div className="connect-url__create-sites-list-unsuccessful">
						<div className="connect-url__create-sites-quantity">
							{ translate( 'Failed to add {{strong}}%(num)d sites{{/strong}}:', {
								args: { num: unsucessfull.length },
								components: { strong: <strong /> },
							} ) }
						</div>
						<ul>
							{ unsucessfull.map( ( site, index ) => (
								<li className="connect-url__create-sites-row" key={ index }>
									<Gridicon icon="cross-circle" />
									<div>{ site.url }</div>
								</li>
							) ) }
						</ul>
					</div>
				</div>
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
