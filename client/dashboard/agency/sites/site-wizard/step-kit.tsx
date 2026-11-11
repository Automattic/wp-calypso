/**
 * The building blocks every wizard step is made from. Steps compose these
 * instead of styling their own boxes, so spacing, widths, and type stay the
 * same from the first screen to the last.
 */
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { chevronDown, Icon } from '@wordpress/icons';
import { useId } from 'react';
import type { ReactNode } from 'react';

/** A titled group of content within a step. Sections stack with even spacing. */
export function Section( {
	title,
	description,
	children,
}: {
	/** Leave it out when the section is the step's only content: the step title already names it. */
	title?: string;
	description?: ReactNode;
	children: ReactNode;
} ) {
	const id = useId();
	return (
		<section className="agency-site-wizard__section" aria-labelledby={ title ? id : undefined }>
			{ title && (
				<VStack spacing={ 1 }>
					<Heading id={ id } level={ 3 } size={ 15 } weight={ 500 }>
						{ title }
					</Heading>
					{ description && <Text variant="muted">{ description }</Text> }
				</VStack>
			) }
			{ children }
		</section>
	);
}

/** Content most people can skip: closed until someone asks for it. */
export function Disclosure( { title, children }: { title: string; children: ReactNode } ) {
	return (
		<details className="agency-site-wizard__disclosure">
			<summary>
				<span>{ title }</span>
				<Icon icon={ chevronDown } size={ 20 } />
			</summary>
			<div className="agency-site-wizard__disclosure-content">{ children }</div>
		</details>
	);
}

/** An ordered sequence: what to check, or what happens next. */
export function NumberedSteps( { items }: { items: { title: string; description: string }[] } ) {
	return (
		<ol className="agency-site-wizard__numbered">
			{ items.map( ( item ) => (
				<li key={ item.title }>
					<Text weight={ 500 }>{ item.title }</Text>
					<Text variant="muted">{ item.description }</Text>
				</li>
			) ) }
		</ol>
	);
}

/** A step's FAQ, built and styled exactly like the one under the first-site story. */
export function Questions( {
	title,
	items,
}: {
	title: string;
	items: { question: string; answer: string }[];
} ) {
	const id = useId();
	return (
		<section className="agency-sites-story__faq" aria-labelledby={ id }>
			<Heading id={ id } level={ 2 }>
				{ title }
			</Heading>
			<div className="agency-sites-story__faq-list">
				{ items.map( ( item ) => (
					<div key={ item.question }>
						<Heading level={ 3 }>{ item.question }</Heading>
						<p>{ item.answer }</p>
					</div>
				) ) }
			</div>
		</section>
	);
}

/** One way to reach a person, with a single, clearly named action. */
export function HelpRow( {
	title,
	description,
	action,
	onAction,
}: {
	title: string;
	description: string;
	action: string;
	onAction: () => void;
} ) {
	return (
		<HStack className="agency-site-wizard__help-row" spacing={ 4 } wrap>
			<VStack spacing={ 1 } className="agency-site-wizard__help-text">
				<Text weight={ 500 }>{ title }</Text>
				<Text variant="muted">{ description }</Text>
			</VStack>
			<Button variant="secondary" onClick={ onAction } __next40pxDefaultSize>
				{ action }
			</Button>
		</HStack>
	);
}

/** A short list of what something includes, each with an icon. */
export function FeatureList( {
	items,
}: {
	items: { icon: JSX.Element; title: string; description: string }[];
} ) {
	return (
		<ul className="agency-site-wizard__features">
			{ items.map( ( item ) => (
				<li key={ item.title }>
					<Icon icon={ item.icon } />
					<VStack spacing={ 0 }>
						<Text weight={ 500 }>{ item.title }</Text>
						<Text variant="muted">{ item.description }</Text>
					</VStack>
				</li>
			) ) }
		</ul>
	);
}
