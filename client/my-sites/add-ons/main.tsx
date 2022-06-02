import { css, Global } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ReactElement } from 'react';

const globalOverrides = css`
	.is-section-add-ons {
		#content.layout__content {
			background: red;
		}
	}
`;

const ContentWithHeader = ( props: { children: ReactElement } ): ReactElement => {
	const translate = useTranslate();

	return (
		<Main wideLayout>
			<DocumentHead title={ translate( 'Add-Ons', { textOnly: true } ) } />

			<FormattedHeader
				brandFont
				headerText={ translate( 'Add-Ons' ) }
				subHeaderText={ translate(
					'Your home base for accessing, setting up, and managing your add-ons.'
				) }
				align="left"
			/>

			{ props.children }
		</Main>
	);
};

const NoAccess = () => {
	const translate = useTranslate();

	return (
		<ContentWithHeader>
			<EmptyContent
				title={ translate( 'You are not authorized to view this page' ) }
				illustration={ '/calypso/images/illustrations/illustration-404.svg' }
			/>
		</ContentWithHeader>
	);
};

const AddOnsMain = () => {
	const selectedSite = useSelector( getSelectedSite );
	const canManageSite = useSelector( ( state ) => {
		if ( ! selectedSite ) {
			return;
		}

		return canCurrentUser( state, selectedSite.ID, 'manage_options' );
	} );

	if ( ! canManageSite ) {
		return <NoAccess />;
	}

	return (
		<div>
			<Global styles={ globalOverrides } />
			<PageViewTracker path="/add-ons/:site" title="Add-Ons" />
			<ContentWithHeader>
				<div>Add-Ons Grid</div>
			</ContentWithHeader>
		</div>
	);
};

export default AddOnsMain;
