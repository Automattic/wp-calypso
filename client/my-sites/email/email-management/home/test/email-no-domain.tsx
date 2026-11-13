/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import EmailNoDomain from '../email-no-domain';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock(
	'calypso/components/empty-content',
	() =>
		( {
			action,
			actionURL,
			secondaryAction,
			secondaryActionURL,
		}: {
			action: string;
			actionURL: string;
			secondaryAction?: string;
			secondaryActionURL?: string;
		} ) => (
			<div>
				<a href={ actionURL }>{ action }</a>
				{ secondaryAction && <a href={ secondaryActionURL }>{ secondaryAction }</a> }
			</div>
		)
);
jest.mock( 'calypso/lib/analytics/track-component-view', () => () => null );
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );

describe( 'EmailNoDomain', () => {
	it.each( [
		[ 'free_plan', false, 'Just search for a domain' ],
		[ 'value_bundle', true, 'Add a Domain' ],
		[ 'value_bundle', false, 'Add a Domain' ],
	] )(
		'marks domain searches as email intent for %s with credit %s',
		( productSlug, hasCredit, label ) => {
			jest.mocked( useSelector ).mockReturnValue( hasCredit );
			render(
				<EmailNoDomain
					selectedSite={
						{
							ID: 123,
							slug: 'example.wordpress.com',
							plan: { product_slug: productSlug },
						} as SiteDetails
					}
					source="inbox"
				/>
			);

			expect( screen.getByRole( 'link', { name: label } ) ).toHaveAttribute(
				'href',
				'/domains/add/example.wordpress.com?emailIntent=true'
			);
		}
	);
} );
