import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { SettingsPageProps } from './types';

const Settings = ( props: SettingsPageProps ): JSX.Element => {
	const translate = useTranslate();

	const renderBreadcrumbs = () => {
		const { selectedSite, currentRoute, selectedDomainName } = props;

		const previousPath = domainManagementEdit(
			selectedSite?.slug,
			selectedDomainName,
			currentRoute
		);

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite?.slug, selectedDomainName ),
			},
			{ label: selectedDomainName },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	return (
		<Main wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderBreadcrumbs() }
			Page goes here.
			{ /* Placeholder to test accordion */ }
			<div style={ { marginTop: '30px' } }>
				<Accordion title="First element title" subtitle="First element subtitle" expanded={ true }>
					<div>Component placeholder: this one is exapanded by default</div>
				</Accordion>
				<Accordion title="Second element title" subtitle="Second element subtitle">
					<div>Component placeholder: this one i'snt exapanded by default</div>
				</Accordion>
			</div>
		</Main>
	);
};

export default connect( ( state, ownProps: SettingsPageProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		hasDomainOnlySite: isDomainOnlySite( state, ownProps.selectedSite!.ID ),
	};
} )( Settings );
