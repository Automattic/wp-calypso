/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function Blocks() {
	return (
		<div className="premium-content-wrapper">
			<InnerBlocks
				allowedBlocks={ [ 'premium-content/subscriber-view', 'premium-content/logged-out-view' ] }
				templateLock={ 'all' }
				template={ [
					[ 'premium-content/subscriber-view' ],
					[ 'premium-content/logged-out-view' ],
				] }
				__experimentalCaptureToolbars
				templateInsertUpdatesSelection={ false }
			/>
		</div>
	);
}
