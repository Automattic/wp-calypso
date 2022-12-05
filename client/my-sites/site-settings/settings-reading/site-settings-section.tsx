import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryPosts from 'calypso/components/data/query-posts';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSitePostsByType } from 'calypso/state/posts/selectors/get-site-posts-by-type';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type Post< PostType extends string > = {
	ID: number;
	title: string;
	type: PostType;
};

type Page = Post< 'page' >;

type HomepageDisplaySettingsProps = {
	siteId: number | null;
	pages: Page[];
};

const HomepageDisplaySettings = ( { siteId, pages }: HomepageDisplaySettingsProps ) => {
	const translate = useTranslate();
	return (
		<>
			<QueryPosts siteId={ siteId } postId={ null } query={ { type: 'page', number: 100 } } />

			<FormFieldset>
				<FormLabel htmlFor="" id="">
					{ translate( 'Your homepage displays' ) }
				</FormLabel>

				<FormLabel>
					<FormRadio
						name=""
						value=""
						checked={ false }
						onChange={ () => {} }
						disabled={ false }
						onClick={ () => {} }
						label={ translate( 'Your latest posts' ) }
						className={ undefined }
					/>
				</FormLabel>

				<FormLabel>
					<FormRadio
						name=""
						value=""
						checked={ false }
						onChange={ () => {} }
						disabled={ false }
						onClick={ () => {} }
						label={ translate( 'A page (select below)' ) }
						className={ undefined }
					/>
				</FormLabel>

				<FormLabel htmlFor="" id="">
					{ translate( 'Homepage' ) }

					<FormSelect value="UTC">
						<option value="UTC">UTC</option>
					</FormSelect>
				</FormLabel>

				<FormLabel htmlFor="" id="">
					{ translate( 'Posts page' ) }

					<FormSelect>
						{ pages.map( ( page ) => (
							<option key={ page.ID } value={ page.ID }>
								{ page.title }
							</option>
						) ) }
					</FormSelect>
				</FormLabel>

				<FormSettingExplanation>
					{ translate(
						'If you choose to display one of your site’s pages as your homepage, you can select any other page to display a list of your latest blog posts. This will replace the content of the selected page as long as it remains selected. Learn more'
					) }
				</FormSettingExplanation>
			</FormFieldset>
		</>
	);
};

type SiteSettingsSectionProps = {
	siteId: number | null;
	pages: Page[];
};

const SiteSettingsSection = ( { siteId, pages = [] }: SiteSettingsSectionProps ) => {
	const translate = useTranslate();

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader title={ translate( 'Site settings' ) } showButton />
			<Card>
				<HomepageDisplaySettings siteId={ siteId } pages={ pages } />
			</Card>
		</>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSite( state )?.ID ?? null;
	const pages = ( siteId && getSitePostsByType( state, siteId, 'page' ) ) ?? [];
	return {
		siteId,
		pages,
	};
} )( SiteSettingsSection );
