import { useTranslate } from 'i18n-calypso';
import GreenCheckmark from 'calypso/assets/images/jetpack/jetpack-green-checkmark.svg';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
}

export default function LicenseBundleCardDescription( { product }: Props ) {
	const translate = useTranslate();

	let textDescription = '';
	const features = [];

	switch ( product.slug ) {
		case 'jetpack-complete':
			textDescription = translate( 'Includes all Security 1TB and full Jetpack package.' );
			features.push(
				translate( 'All Security products' ),
				translate( '1TB cloud storage' ),
				translate( 'Full Jetpack package' )
			);
			break;
		case 'jetpack-security-t1':
			textDescription = translate(
				'Includes VaultPress Backup 10GB, Scan Daily and Akismet Anti-spam.'
			);
			features.push(
				translate( 'VaultPress Backup 10GB' ),
				translate( 'Scan Daily' ),
				translate( 'Akismet Anti-spam*' )
			);
			break;
		case 'jetpack-security-t2':
			textDescription = translate(
				'Includes VaultPress Backup 1TB, Scan Daily and Akismet Anti-spam.'
			);
			features.push(
				translate( 'VaultPress Backup 1TB' ),
				translate( 'Scan Daily' ),
				translate( 'Akismet Anti-spam*' )
			);
			break;
		case 'jetpack-anti-spam':
			textDescription = translate( 'Automatically clear spam from your comments and forms.' );
			break;
		case 'jetpack-backup-t1':
			textDescription = translate( 'Real-time cloud backups with one-click restores.' );
			break;
		case 'jetpack-backup-t2':
			textDescription = translate( 'Real-time cloud backups with one-click restores.' );
			break;
		case 'jetpack-boost':
			textDescription = translate(
				'Essential tools to speed up your site - no developer required.'
			);
			break;
		case 'jetpack-scan':
			textDescription = translate( 'Automatic malware scanning with one-click fixes.' );
			break;
		case 'jetpack-videopress':
			textDescription = translate(
				'High-quality, ad-free video built specifically for WordPress.'
			);
			break;
		case 'jetpack-social-basic':
			textDescription = translate( 'Write once, post everywhere.' );
			break;
		case 'jetpack-social-advanced':
			textDescription = translate( 'Write once, post everywhere.' );
			break;
		case 'jetpack-search':
			textDescription = translate( 'Help your site visitors find answers instantly.' );
			break;
	}

	return (
		<div className="license-bundle-card-description">
			<p className="license-bundle-card-description__text">{ textDescription }</p>
			<ul className="license-bundle-card-description__list">
				{ features.map( ( feature ) => (
					<li key={ feature }>
						<img src={ GreenCheckmark } alt={ translate( 'included' ) } />
						{ feature }
					</li>
				) ) }
			</ul>
		</div>
	);
}
