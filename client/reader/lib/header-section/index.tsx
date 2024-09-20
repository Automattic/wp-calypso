import { useTranslate } from 'i18n-calypso';
import React from 'react';

const ReaderHeaderSection = () => {
	const translate = useTranslate();

	return (
		<div className="logged-out-reader-header">
			<h2>
				{
					// translators: The title of the reader tag page
					translate( 'WordPress Reader' )
				}
			</h2>
			<h1>{ translate( 'Enjoy millions of blogs at your fingertips.' ) }</h1>
		</div>
	);
};

const renderHeaderSection = () => <ReaderHeaderSection />;

export default renderHeaderSection;
