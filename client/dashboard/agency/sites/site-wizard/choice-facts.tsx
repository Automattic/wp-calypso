import { __, sprintf } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import type { ComponentProps } from 'react';

export type ChoiceFact = {
	label: string;
	icon: ComponentProps< typeof Icon >[ 'icon' ];
};

/**
 * Short facts under a choice card. Rows line up across sibling cards, so the
 * same row compares the same thing for every option.
 */
export default function ChoiceFacts( { title, facts }: { title: string; facts: ChoiceFact[] } ) {
	return (
		<ul
			className="agency-site-wizard__choice-facts"
			aria-label={ sprintf(
				/* translators: %s is the name of a site setup option. */
				__( 'About %s' ),
				title
			) }
		>
			{ facts.map( ( fact ) => (
				<li key={ fact.label }>
					<Icon icon={ fact.icon } size={ 20 } aria-hidden="true" />
					<span>{ fact.label }</span>
				</li>
			) ) }
		</ul>
	);
}
