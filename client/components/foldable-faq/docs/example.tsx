/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * internal dependencies
 */
import FoldableFAQ from 'calypso/components/foldable-faq';

/**
 * Style dependencies
 */
import './style.scss';

export default function FoldableFAQExample() {
	const translate = useTranslate();
	return (
		<section className="docs__foldable-faq">
			<h2 className="docs__foldable-faq-heading">Frequently Asked Questions</h2>
			<FoldableFAQ question={ translate( 'Have questions?' ) }>
				{ translate( 'We have answers!' ) }
			</FoldableFAQ>
			<FoldableFAQ question={ translate( 'Have more questions?' ) }>
				{ translate( 'No problem! Feel free to get in touch with our Happiness Engineers.' ) }
			</FoldableFAQ>
		</section>
	);
}

FoldableFAQExample.displayName = 'FoldableFAQ';
