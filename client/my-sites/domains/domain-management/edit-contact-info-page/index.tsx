import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import { EditContactInfoPageProps } from './types';

const EditContactInfoPage = ( props: EditContactInfoPageProps ): JSX.Element => {
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
			{
				label: selectedDomainName,
				href: previousPath,
			},
			{ label: translate( 'Edit contact infomation' ) },
		];

		const mobileItem = {
			label: translate( 'Back' ),
			href: previousPath,
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	return (
		<Main className="edit-contact-info-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderBreadcrumbs() }
			<TwoColumnsLayout content={ <div>CONTENT HERE</div> } sidebar={ <div>SIDEBAR HERE</div> } />
		</Main>
	);
};

export default connect( ( state, ownProps: EditContactInfoPageProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( EditContactInfoPage );
