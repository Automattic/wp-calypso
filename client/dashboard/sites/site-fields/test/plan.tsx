/**
 * @jest-environment jsdom
 */
import { AuthContext } from '../../../app/auth';
import { render as testUtilsRender } from '../../../test-utils';
import { wpcomLink } from '../../../utils/link';
import { Plan } from '../index';
import type { User, Site } from '@automattic/api-core';

const userId = 1;

function render( ui: React.ReactElement ) {
	return testUtilsRender(
		<AuthContext.Provider
			value={ { user: { ID: userId } as User, logout: () => Promise.resolve() } }
		>
			{ ui }
		</AuthContext.Provider>
	);
}

describe( '<Plan>', () => {
	test( 'for self-hosted, Jetpack-connected sites, active Jetpack plugin, it renders the Jetpack logo and plan name', () => {
		const { container } = render(
			<Plan isJetpack isSelfHostedJetpackConnected value="Free" nag={ { isExpired: false } } />
		);
		expect( container.querySelector( 'svg' ) ).toBeInTheDocument();
		expect( container.textContent ).toBe( 'Free' );
	} );

	test( 'for self-hosted, Jetpack-connected sites, inactive Jetpack plugin, it renders dash', () => {
		const { container } = render(
			<Plan
				isJetpack={ false }
				isSelfHostedJetpackConnected
				value="Free"
				nag={ { isExpired: false } }
			/>
		);
		expect( container.textContent ).toBe( '-' );
	} );

	test( 'for WordPress.com Simple sites, it renders the value prop', () => {
		const { container } = render(
			<Plan
				isJetpack={ false }
				isSelfHostedJetpackConnected={ false }
				value="Premium"
				nag={ { isExpired: false } }
			/>
		);
		expect( container.textContent ).toBe( 'Premium' );
	} );

	test( 'for WordPress.com Atomic sites, it renders the plan name', () => {
		const { container } = render(
			<Plan
				isJetpack
				isSelfHostedJetpackConnected={ false }
				value="Business"
				nag={ { isExpired: false } }
			/>
		);
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'for sites with expired plan, it renders the plan name with "-expired" suffix', () => {
		const site = {
			plan: {
				product_name_short: 'Business',
				expired: true,
			},
		} as Site;
		const { container } = render(
			<Plan
				isJetpack={ false }
				isSelfHostedJetpackConnected={ false }
				value="Business"
				nag={ { isExpired: true, site } }
			/>
		);
		expect( container.textContent ).toBe( 'Business-expired' );
	} );

	test( 'for sites with expired plan, it renders the plan name with "-expired" suffix and a renewal nag for the site owner', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_owner: userId,
			plan: {
				product_slug: 'business-bundle',
				product_name_short: 'Business',
				expired: true,
			},
		} as Site;
		const { getByText, getByRole } = render(
			<Plan
				isJetpack={ false }
				isSelfHostedJetpackConnected={ false }
				isOwner
				value="Business"
				nag={ { isExpired: true, site } }
			/>
		);
		expect( getByText( 'Business-expired' ) ).toBeInTheDocument();
		expect( getByRole( 'link', { name: /Renew plan/ } ) ).toHaveAttribute(
			'href',
			wpcomLink( '/checkout/test.wordpress.com/business-bundle' )
		);
	} );

	test( 'for Trial sites with expired plan, it renders the plan name with "-expired" suffix and an upgrade nag for the site owner', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_owner: userId,
			plan: {
				product_slug: 'ecommerce-trial-bundle-monthly',
				product_name_short: 'Trial',
				expired: true,
			},
		} as Site;
		const { getByText, getByRole } = render(
			<Plan
				isJetpack={ false }
				isSelfHostedJetpackConnected={ false }
				isOwner
				value="Trial"
				nag={ { isExpired: true, site } }
			/>
		);
		expect( getByText( 'Trial-expired' ) ).toBeInTheDocument();
		expect( getByRole( 'link', { name: /Upgrade/ } ) ).toHaveAttribute(
			'href',
			wpcomLink( '/plans/test.wordpress.com' )
		);
	} );
} );
