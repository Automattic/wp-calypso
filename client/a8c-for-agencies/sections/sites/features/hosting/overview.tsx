import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import DocumentHead from 'calypso/components/data/document-head';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { Site } from '../../types';

import './style.scss';

type Props = {
	site: Site;
};

const HostingOverviewPreview = ( { site }: Props ) => {
	const translate = useTranslate();

	const formatHostingProviderName = ( hostProviderGuess: string ) => {
		if ( ! hostProviderGuess ) {
			return translate( 'Unknown' );
		}

		if ( hostProviderGuess.toLowerCase() === 'automattic' ) {
			return (
				<>
					<WordPressLogo className="hosting__hosting-logo" size={ 16 } />
					WordPress.com
				</>
			);
		}

		if ( hostProviderGuess.toLowerCase() === 'pressable' ) {
			return (
				<>
					<img src={ pressableIcon } className="hosting__hosting-logo" alt="Pressable" />
					Pressable
				</>
			);
		}

		// Currently we are only converting the name from 'snake_case' and 'kebab-case' to 'Title Case'
		const formattedName = hostProviderGuess
			.replace( /[-_]/g, ' ' )
			.split( ' ' )
			.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
			.join( ' ' );

		return formattedName;
	};

	return (
		<>
			<DocumentHead title={ translate( 'Hosting' ) } />
			<div className="hosting__wrapper">
				<div className="card hosting__card">
					<div className="hosting__header">
						<div className="hosting__title">{ translate( 'Site Information' ) } </div>
					</div>
					<div className="hosting__content">
						<div className="hosting__content-row">
							<div className="hosting__content-label">Host</div>
							<div className="hosting__content-value">
								{ formatHostingProviderName( site.hosting_provider_guess ) }
							</div>
						</div>
						{ site.hosting_provider_guess.toLowerCase() === 'pressable' && (
							<div className="hosting__content-row">
								<div className="hosting__content-label"></div>

								<div className="hosting__content-value">
									<Button
										target="_blank"
										rel="norefferer nooppener"
										href="https://my.pressable.com/agency/auth"
										variant="link"
									>
										{ translate( 'Manage all Pressable sites' ) }
										<Icon icon={ external } size={ 18 } />
									</Button>
								</div>
							</div>
						) }

						<div className="hosting__content-row">
							<div className="hosting__content-label">PHP version</div>
							<div className="hosting__content-value">
								{ site.php_version ? site.php_version : translate( 'Unknown' ) }
							</div>
						</div>
						<div className="hosting__content-row">
							<div className="hosting__content-label">WordPress version</div>
							<div className="hosting__content-value">
								{ site.wordpress_version ? site.wordpress_version : translate( 'Unknown' ) }
							</div>
						</div>
						<div></div>
					</div>
				</div>
			</div>
		</>
	);
};

export default HostingOverviewPreview;
