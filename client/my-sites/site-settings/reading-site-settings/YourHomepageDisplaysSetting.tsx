import { FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import useDropdownPagesQuery, {
	DropdownPagesResponse,
	PageNode,
} from 'calypso/data/dropdown-pages/use-dropdown-pages';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PAGE_TITLE_DEPTH_PADDING = '—'; // em dash
const SPACE = ' ';

const toDropdownPageTitle = ( pageTitle: string, depth = 0 ) => {
	const padding = `${ PAGE_TITLE_DEPTH_PADDING.repeat( depth ) }`;
	return `${ padding }${ padding ? SPACE : '' }${ pageTitle }`;
};

type DropdownPage = {
	ID: number;
	title: string;
};

const insertPageNodeToDropdownPages = (
	{ ID, title, children }: PageNode,
	dropdownPages: DropdownPage[],
	depth = 0
) => {
	const dropdownPage = {
		ID,
		title: toDropdownPageTitle( title, depth ),
	};
	dropdownPages.push( dropdownPage );
	children?.forEach( ( childPageNode ) => {
		insertPageNodeToDropdownPages( childPageNode, dropdownPages, depth + 1 );
	} );
};

const toFlatDropdownPages = ( {
	dropdown_pages: pageNodes,
}: DropdownPagesResponse ): DropdownPage[] => {
	const dropdownPages: DropdownPage[] = [];
	pageNodes.forEach( ( pageNode ) => {
		insertPageNodeToDropdownPages( pageNode, dropdownPages );
	} );
	return dropdownPages;
};

type YourHomepageDisplaysValue = {
	show_on_front?: 'posts' | 'page';
	page_on_front?: string;
	page_for_posts?: string;
};

type YourHomepageDisplaysSettingProps = {
	value: YourHomepageDisplaysValue;
	onChange?: ( value: Partial< YourHomepageDisplaysValue > ) => void;
	disabled?: boolean;
	updateFields?: ( fields: Partial< YourHomepageDisplaysValue > ) => void;
	siteId?: number;
};

const YourHomepageDisplaysSetting = ( {
	value: { page_for_posts, page_on_front } = {},
	onChange,
	disabled,
	siteId,
}: YourHomepageDisplaysSettingProps ) => {
	const translate = useTranslate();

	const { data: pages, isLoading } = useDropdownPagesQuery<
		ReturnType< typeof toFlatDropdownPages >
	>( siteId, {
		select: toFlatDropdownPages,
	} );

	const handlePageOnFrontChange: React.FormEventHandler = ( { target } ) => {
		const selectedPageId: string = ( target as HTMLSelectElement ).value;
		if ( selectedPageId === '' ) {
			// Default was selected, so we need to set show_on_front to 'posts'
			onChange?.( { show_on_front: 'posts', page_on_front: '' } );
		} else {
			onChange?.( { show_on_front: 'page', page_on_front: selectedPageId } );
		}
	};

	const handlePageForPostsChange: React.FormEventHandler = ( { target } ) => {
		const selectedPageId: string = ( target as HTMLSelectElement ).value;
		onChange?.( { page_for_posts: selectedPageId } );
	};

	return (
		<FormFieldset>
			<FormLabel>{ translate( 'Your homepage displays' ) }</FormLabel>

			<FormLabel htmlFor="homepage-page-select">
				<FormSelect
					id="homepage-page-select"
					className="select-homepage-setting"
					name="page_on_front"
					disabled={ disabled || isLoading || ! pages?.length }
					value={ page_on_front }
					onChange={ handlePageOnFrontChange }
				>
					<option value="">{ translate( '—— Default ——' ) }</option>
					{ pages?.map( ( page ) => {
						return (
							<option
								key={ page.ID }
								value={ page.ID }
								disabled={ page.ID === Number( page_for_posts ) }
							>
								{ page.title }
							</option>
						);
					} ) }
				</FormSelect>
			</FormLabel>

			<FormLabel htmlFor="posts-page-select" className="default-posts-page-setting">
				{ translate( 'Default posts page' ) }

				<FormSelect
					id="posts-page-select"
					name="page_for_posts"
					disabled={ disabled || isLoading || ! pages?.length }
					value={ page_for_posts }
					onChange={ handlePageForPostsChange }
				>
					<option value="">{ translate( '—— None ——' ) }</option>
					{ pages?.map( ( page ) => {
						return (
							<option
								key={ page.ID }
								value={ page.ID }
								disabled={ page.ID === Number( page_on_front ) }
							>
								{ page.title }
							</option>
						);
					} ) }
				</FormSelect>
			</FormLabel>

			<FormSettingExplanation>
				{ translate(
					'Default homepage and posts page content and layout are determined by your active theme. {{aboutTemplatesLink}}Learn more{{/aboutTemplatesLink}}.',
					{
						components: {
							aboutTemplatesLink: (
								<a
									className="learn-more-link"
									href={ localizeUrl( 'https://wordpress.com/support/pages/front-page/' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};

export default connect( ( state: IAppState ) => {
	const siteId = getSelectedSiteId( state );
	return { ...( siteId && { siteId } ) };
} )( YourHomepageDisplaysSetting );
