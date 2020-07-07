/**
 * External dependencies
 */
import { RichText } from '@wordpress/block-editor';

const save = ( props ) => {
	const {
		attributes: { title, tiers, id },
	} = props;

	const dataProps = {
		'data-tiers': JSON.stringify( tiers ),
		'data-id': id,
	};

	return (
		<div>
			<RichText.Content tagName="h2" value={ title } />
			<div className="wp-block-janitorial-state-widget-main-container" { ...dataProps }>
				{ ' ' }
			</div>
		</div>
	);
};

export default save;
