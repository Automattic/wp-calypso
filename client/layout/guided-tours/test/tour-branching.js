/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { tourBranching } from '../tour-branching';

describe( 'Guided Tours Branching', () => {
	test( 'tourBranching returns a branch tree for a tour JSX tree', () => {
		// We are testing just a tree of elements created by React.createElement. The actual
		// component types don't matter (never rendered) and can be null.
		const Fragment = 'Fragment';
		const Tour = 'Tour';
		const Step = 'Step';
		const ButtonRow = 'ButtonRow';
		const SiteLink = 'SiteLink';

		// These components have `step` props and are checked for `displayName` and `name`
		const Continue = () => null;
		const Next = () => null;

		const tourTree = (
			<Tour name="checklistPublishPost" version="20171205">
				<Step name="init">
					{ ( { translate } ) => (
						<Fragment>
							<p>{ translate( 'It’s time to get your blog rolling with your first post.' ) }</p>
							<ButtonRow>
								<Next step="categories-tags">{ translate( 'All done, continue' ) }</Next>
								<SiteLink>{ translate( 'Return to the checklist' ) } </SiteLink>
								<Continue step="categories-tags" hidden />
							</ButtonRow>
						</Fragment>
					) }
				</Step>

				<Step name="categories-tags">
					{ ( { translate } ) => (
						<Fragment>
							<p>{ translate( 'Categories and Tags' ) }</p>
							<Next step="featured-images">{ translate( 'All done, continue' ) }</Next>
						</Fragment>
					) }
				</Step>

				<Step name="featured-images">
					{ ( { translate } ) => (
						<Fragment>
							<Continue step="choose-image">
								<p>{ translate( 'Press anywhere on this image so we can change it.' ) }</p>
							</Continue>
						</Fragment>
					) }
				</Step>
				<Step name="choose-image">
					{ ( { translate } ) => (
						<Fragment>
							<p>{ translate( 'Either pick an image below or add a new one.' ) }</p>
							<Next step="click-set-featured-image">{ translate( 'All done, continue' ) }</Next>
						</Fragment>
					) }
				</Step>
				<Step name="click-set-featured-image">
					{ ( { translate } ) => (
						<Fragment>
							<Continue step="click-update">{ translate( 'We’re all set' ) }</Continue>
						</Fragment>
					) }
				</Step>
				<Step name="click-update">
					{ ( { translate } ) => (
						<Fragment>
							<Continue step="finish">{ translate( 'Almost done' ) }</Continue>
						</Fragment>
					) }
				</Step>
				<Step name="finish">
					{ ( { translate } ) => (
						<Fragment>
							<p>{ translate( 'You published your first blog post.' ) }</p>
						</Fragment>
					) }
				</Step>
			</Tour>
		);

		expect( tourBranching( tourTree ) ).toEqual( {
			init: {
				next: 'categories-tags',
				continue: 'categories-tags',
			},
			'categories-tags': {
				next: 'featured-images',
			},
			'featured-images': {
				continue: 'choose-image',
			},
			'choose-image': {
				next: 'click-set-featured-image',
			},
			'click-set-featured-image': {
				continue: 'click-update',
			},
			'click-update': {
				continue: 'finish',
			},
			finish: {},
		} );
	} );
} );
