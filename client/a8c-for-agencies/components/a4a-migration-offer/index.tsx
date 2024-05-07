import { Button, FoldableCard } from '@automattic/components';
import { Icon, reusableBlock, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type Props = {
	foldable?: boolean;
};

const MigrationOfferHeader = () => {
	const translate = useTranslate();
	const title = translate( 'Special limited-time migration offer for our partners' );
	return (
		<div className="a4a-migration-offer__title">
			<Icon icon={ reusableBlock } size={ 32 } />
			<h3>{ title }</h3>
		</div>
	);
};

const MigrationOfferBody = () => {
	const translate = useTranslate();
	const description = translate(
		'Migrate your clients sites to WordPress.com or Pressable hosting and earn 50% revenue share until June 30, 2024. You’ll also receive an additional $100 for each migrated site—up to $3,000 until July 31, 2024.'
	);
	const note = translate( 'Must have 3 or more sites to be eligible.' );

	return (
		<>
			<p className="a4a-migration-offer__description">{ description }</p>
			<p className="a4a-migration-offer__note">{ note }</p>
			<Button
				className="a4a-migration-offer__chat-button"
				href="mailto:partnerships@automattic.com"
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
			header={ <MigrationOfferHeader /> }
			expanded
			clickableHeader
			summary={ false }
		>
			<MigrationOfferBody />
		</FoldableCard>
	) : (
		<div className="a4a-migration-offer__wrapper non-foldable">
			<MigrationOfferHeader />
			<MigrationOfferBody />
		</div>
	);
};

export default MigrationOffer;
