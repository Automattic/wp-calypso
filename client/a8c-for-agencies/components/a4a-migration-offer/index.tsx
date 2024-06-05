import page from '@automattic/calypso-router';
import { Button, FoldableCard } from '@automattic/components';
import { Icon, reusableBlock, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { A4A_OVERVIEW_LINK } from '../sidebar-menu/lib/constants';

import './style.scss';
type Props = {
	foldable?: boolean;
};

const MigrationOfferHeader = ( { withIcon }: { withIcon?: boolean } ) => {
	const translate = useTranslate();
	const title = translate( 'Special limited-time migration offer for our partners' );
	return (
		<div className="a4a-migration-offer__title">
			{ withIcon && <Icon icon={ reusableBlock } size={ 32 } /> }
			<h3>{ title }</h3>
		</div>
	);
};

const MigrationOfferBody = () => {
	const translate = useTranslate();
	const description = translate(
		'Migrate your clients sites to WordPress.com or Pressable hosting and earn 50% revenue share until June 30, 2024. You’ll also receive an additional $100 for each migrated site—up to $3,000 until July 31, 2024.'
	);

	return (
		<>
			<p className="a4a-migration-offer__description">{ description }</p>
			<Button
				className="a4a-migration-offer__chat-button"
				onClick={ () => {
					page( `${ A4A_OVERVIEW_LINK }#contact-support-migration-offer` );
				} }
				primary
			>
				{ translate( 'Chat with us' ) }
				<Icon icon={ external } size={ 18 } />
			</Button>
			<Button
				className="a4a-migration-offer__details-button"
				href="https://automattic.com/for-agencies/program-incentives/"
				rel="nooppener norefferer"
				target="_blank"
			>
				{ translate( 'See details' ) }
				<Icon icon={ external } size={ 18 } />
			</Button>
		</>
	);
};

const MigrationOffer = ( props: Props ) => {
	const { foldable } = props;

	return foldable ? (
		<FoldableCard
			className="a4a-migration-offer__wrapper"
			header={ <MigrationOfferHeader withIcon /> }
			expanded
			clickableHeader
			summary={ false }
		>
			<MigrationOfferBody />
		</FoldableCard>
	) : (
		<div className="a4a-migration-offer__wrapper non-foldable">
			<div className="a4a-migration-offer__aside">
				<Icon icon={ reusableBlock } size={ 24 } />
			</div>

			<div className="a4a-migration-offer__main">
				<MigrationOfferHeader />
				<MigrationOfferBody />
			</div>
		</div>
	);
};

export default MigrationOffer;
