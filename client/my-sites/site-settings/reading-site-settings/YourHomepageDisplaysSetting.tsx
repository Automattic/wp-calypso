import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import usePostsQuery from 'calypso/data/posts/use-posts-query';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
	siteSlug?: string;
};

const YourHomepageDisplaysSetting = ( {
	value: { show_on_front, page_for_posts, page_on_front } = {},
	onChange,
	disabled,
	siteId,
	siteSlug,
}: YourHomepageDisplaysSettingProps ) => {
	const translate = useTranslate();
	const { data: pages, isLoading } = usePostsQuery(
		siteId,
		{ type: 'page' },
		{ select: ( { posts } ) => posts }
	);
	return (
		<FormFieldset>
			<FormLabel>{ translate( 'Your homepage displays' ) }</FormLabel>

			<FormLabel>
				<FormRadio
					value="posts"
					checked={ ! show_on_front || show_on_front === 'posts' }
					onChange={ ( { target: { value } }: ChangeEvent< HTMLInputElement > ) =>
						value === 'posts' && onChange?.( { show_on_front: 'posts' } )
					}
					disabled={ disabled || isLoading }
					label={ translate( 'Your latest posts' ) }
					className={ undefined }
				/>
			</FormLabel>

			<FormLabel>
				<FormRadio
					name="show_on_front"
					value="page"
					checked={ show_on_front === 'page' }
					onChange={ ( { target: { value } }: ChangeEvent< HTMLInputElement > ) =>
						value === 'page' && onChange?.( { show_on_front: 'page' } )
					}
					disabled={ disabled || isLoading }
					label={ translate( 'A {{toSitePagesLink}}page{{/toSitePagesLink}} (select below)', {
						components: {
							toSitePagesLink: (
								<a href={ `/pages/${ siteSlug }` } target="_blank" rel="noreferrer" />
							),
						},
					} ) }
					className={ undefined }
				/>
			</FormLabel>

			<FormLabel htmlFor="homepage-page-select">
				{ translate( 'Homepage' ) }

				<FormSelect
					id="homepage-page-select"
					name="page_on_front"
					disabled={ disabled || isLoading || show_on_front !== 'page' || ! pages?.length }
					value={ page_on_front }
					onChange={ ( { target } ) =>
						onChange?.( { page_on_front: ( target as HTMLSelectElement ).value } )
					}
				>
					<option value="">{ translate( '-- Select --' ) }</option>
					{ pages?.map( ( page ) => {
						if ( page_for_posts && page_for_posts === String( page.ID ) ) {
							return null;
						}

						return (
							<option key={ page.ID } value={ page.ID }>
								{ page.title }
							</option>
						);
					} ) }
				</FormSelect>
			</FormLabel>

			<FormLabel htmlFor="posts-page-select">
				{ translate( 'Posts page' ) }

				<FormSelect
					id="posts-page-select"
					name="page_for_posts"
					disabled={ disabled || isLoading || show_on_front !== 'page' || ! pages?.length }
					value={ page_for_posts }
				>
					<option value="">{ translate( '-- Select --' ) }</option>
					{ pages?.map( ( page ) => {
						if ( page_on_front && page_on_front === String( page.ID ) ) {
							return null;
						}

						return (
							<option key={ page.ID } value={ page.ID }>
								{ page.title }
							</option>
						);
					} ) }
				</FormSelect>
			</FormLabel>

			<FormSettingExplanation>
				{ translate(
					'If you choose to assign a {{aboutFrontPageLink}}static homepage{{/aboutFrontPageLink}}, you can also choose to assign a default posts page. Your default posts page will be controlled by a dedicated template as determined by your theme. In Classic themes, this posts page cannot be customized, {{aboutPostsPageLink}}Learn More{{/aboutPostsPageLink}}. In Block themes, you can customize the posts page template, {{aboutTemplatesLink}}Learn More{{/aboutTemplatesLink}}.',
					{
						components: {
							aboutFrontPageLink: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/pages/front-page/' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
							aboutPostsPageLink: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/posts-page/' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
							aboutTemplatesLink: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/templates/' ) }
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

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	return {
		...( siteId && { siteId } ),
		...( siteSlug && { siteSlug } ),
	};
} )( YourHomepageDisplaysSetting );
