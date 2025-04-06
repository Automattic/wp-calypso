/**
 * External dependencies
 */
import {
	Icon,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, pages, tag } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';

export function Home() {
	return (
		<Page className="screen-home" title={ __( 'Dashboard', 'a8c-site-admin' ) }>
			<div className="welcome-panel">
				<Heading className="welcome-panel__heading" color="#fff" level={ 2 }>
					{ __( 'Welcome to WordPress!', 'a8c-site-admin' ) }
				</Heading>
				<p className="welcome-panel__description">
					{ __(
						'The open source publishing platform of choice for millions of websites worldwide—from creators and small businesses to enterprises.',
						'a8c-site-admin'
					) }
				</p>
			</div>

			<div className="screen-main-area">
				<Grid gap={ 16 } templateColumns="repeat(auto-fit, minmax(256px, 1fr))">
					<HStack spacing={ 8 } alignment="top">
						<div>
							<Icon className="screen-main-area__card-icon" icon={ pages } size={ 48 } />
						</div>
						<div className="screen-main-area__card">
							<Heading level={ 3 }>{ __( 'Manage your pages', 'a8c-site-admin' ) }</Heading>
							<p>
								{ __(
									'Pages are static content—ideal for things like your homepage, About page, or Contact page.',
									'a8c-site-admin'
								) }
							</p>
							<p>
								{ __(
									"They're not part of your blog timeline, and they usually represent timeless information. Use this section to create, edit, or remove the core sections of your site.",
									'a8c-site-admin'
								) }
							</p>
							<Link to="/pages">{ __( 'Go to pages', 'a8c-site-admin' ) }</Link>
						</div>
					</HStack>

					<HStack spacing={ 8 } alignment="top">
						<div>
							<Icon className="screen-main-area__card-icon" icon={ category } size={ 48 } />
						</div>
						<div className="screen-main-area__card">
							<Heading level={ 3 }>
								{ __( 'Organize your posts with categories', 'a8c-site-admin' ) }
							</Heading>
							<p>
								{ __( 'Categories group your blog posts into broad topics.', 'a8c-site-admin' ) }
							</p>

							<p>
								{ __(
									"They're hierarchical, which means you can create sub-categories to better structure your content. Visitors can browse your site more efficiently by filtering posts by category.",
									'a8c-site-admin'
								) }
							</p>

							<Link to="/categories">{ __( 'Go to categories', 'a8c-site-admin' ) }</Link>
						</div>
					</HStack>

					<HStack spacing={ 8 } alignment="top">
						<div>
							<Icon className="screen-main-area__card-icon" icon={ tag } size={ 48 } />
						</div>
						<div className="screen-main-area__card">
							<Heading level={ 3 }>
								{ __( 'Use tags to describe your content', 'a8c-site-admin' ) }
							</Heading>

							<p>
								{ __( 'Tags let you label your posts with specific keywords.', 'a8c-site-admin' ) }
							</p>
							<p>
								{ __(
									"Unlike categories, tags aren't hierarchical. They're best for highlighting specific topics, themes, or references mentioned in a post. Tags help users discover related content through search and filtering.",
									'a8c-site-admin'
								) }
							</p>
							<Link to="/tags">{ __( 'Go to tags', 'a8c-site-admin' ) }</Link>
						</div>
					</HStack>
				</Grid>
			</div>
		</Page>
	);
}
