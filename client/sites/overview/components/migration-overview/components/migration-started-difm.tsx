import { useHasEnTranslation } from '@automattic/i18n-utils';
import { globe, group, Icon, scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { Container, Header } from './layout';

type MigrationStartedListProps = {
	children: ReactElement< MigrationStartedItemProps > | ReactElement< MigrationStartedItemProps >[];
};

type MigrationStartedItemProps = {
	icon: Parameters< typeof Icon >[ 0 ][ 'icon' ];
	text: string;
};

const MigrationStartedList = ( { children }: MigrationStartedListProps ) => (
	<ul className="migration-started-difm__list">{ children }</ul>
);

const MigrationStartedItem = ( { icon, text }: MigrationStartedItemProps ) => (
	<li className="migration-started-difm__item">
		<div className="migration-started-difm__icon-wrapper">
			<Icon icon={ icon } className="migration-started-difm__icon" size={ 30 } />
		</div>
		<span>{ text }</span>
	</li>
);

export const MigrationStartedDIFM = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const title = translate( "We've received your migration request" );
	const subTitle = hasEnTranslation(
		"We will review your site to make sure we have everything we need. Here's what you can expect next:"
	)
		? translate(
				"We will review your site to make sure we have everything we need. Here's what you can expect next:"
		  )
		: translate(
				"Our team has received your details. We will review your site to make sure we have everything we need. Here's what you can expect next:"
		  );

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-started-difm">
				<h2 className="migration-started-difm__title">{ translate( 'What to expect' ) }</h2>
				<MigrationStartedList>
					<MigrationStartedItem
						icon={ group }
						text={ translate(
							"We'll bring over a copy of your site, without affecting the current live version."
						) }
					/>
					<MigrationStartedItem
						icon={ scheduled }
						text={ translate(
							"You'll get an update on the progress of your migration within 2-3 business days."
						) }
					/>
					<MigrationStartedItem
						icon={ globe }
						text={ translate(
							"We'll help you switch your domain over after the migration's completed."
						) }
					/>
				</MigrationStartedList>
			</div>
		</Container>
	);
};
