import {
	SelectControl,
	TextControl,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

type Props = {
	value: string;
	onChange: ( value: string ) => void;
};

const SITE_TYPES = [
	{ value: 'blog', label: 'blog' },
	{ value: 'newsletter', label: 'newsletter' },
	{ value: 'online store', label: 'online store' },
	{ value: 'portfolio', label: 'portfolio' },
	{ value: 'small business site', label: 'small business site' },
	{ value: 'community', label: 'community' },
];

export default function SentenceStep( { value, onChange }: Props ) {
	const translate = useTranslate();
	const [ siteType, setSiteType ] = useState< string >( SITE_TYPES[ 0 ].value );
	const [ subject, setSubject ] = useState< string >( '' );

	// Build the prompt sentence and push it up so the wizard's submit
	// button can see whether we have enough to proceed.
	useEffect( () => {
		const next = subject.trim() ? `A ${ siteType } for ${ subject.trim() }.` : `A ${ siteType }.`;
		onChange( next );
	}, [ siteType, subject, onChange ] );

	return (
		<VStack spacing={ 4 } className="home-wizard__step home-wizard__step--sentence">
			<VStack spacing={ 1 }>
				<Heading level={ 2 } size={ 20 }>
					{ translate( 'Let’s start with the basics' ) }
				</Heading>
				<Text variant="muted">{ translate( 'Two quick fields and we’re off.' ) }</Text>
			</VStack>

			<div
				className="home-wizard__sentence"
				aria-label={ translate( 'Site description' ) as string }
			>
				<HStack alignment="center" spacing={ 2 } wrap>
					<Text size={ 18 } weight={ 500 }>
						{ translate( 'I want to build a' ) }
					</Text>
					<div className="home-wizard__sentence-select">
						<SelectControl
							__nextHasNoMarginBottom
							label={ translate( 'Site type' ) as string }
							hideLabelFromVision
							value={ siteType }
							options={ SITE_TYPES }
							onChange={ ( v ) => setSiteType( v ) }
						/>
					</div>
					<Text size={ 18 } weight={ 500 }>
						{ translate( 'for' ) }
					</Text>
					<div className="home-wizard__sentence-input">
						<TextControl
							__nextHasNoMarginBottom
							label={ translate( 'Audience or topic' ) as string }
							hideLabelFromVision
							value={ subject }
							onChange={ setSubject }
							placeholder={ translate( 'indie game developers' ) as string }
						/>
					</div>
					<Text size={ 18 } weight={ 500 }>
						.
					</Text>
				</HStack>
			</div>

			<Text variant="muted" size={ 12 }>
				{ value && translate( 'Preview: %(prompt)s', { args: { prompt: value } } ) }
			</Text>
		</VStack>
	);
}
