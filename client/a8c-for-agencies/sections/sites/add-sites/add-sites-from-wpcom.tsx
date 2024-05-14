import { useTranslate } from 'i18n-calypso';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, { LayoutHeaderTitle } from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import './styles.scss';

const AddSitesFromWPCOM = () => {
	const translate = useTranslate();
	return (
		<LayoutColumn className="add-sites-from-wpcom add-sites-from-wpcom__layout" wide>
			<LayoutTop>
				<LayoutHeader>
					<LayoutHeaderTitle>{ translate( 'Add sites from WordPress.com' ) }</LayoutHeaderTitle>
				</LayoutHeader>
			</LayoutTop>
		</LayoutColumn>
	);
};

export default AddSitesFromWPCOM;
