import { LoadingPlaceholder } from '@automattic/components';
import { css } from '@emotion/css';
import { FunctionComponent } from 'react';

const GranularRestoreLoading: FunctionComponent = () => {
	return (
		<>
			<div className="rewind-flow__header">
				<LoadingPlaceholder
					className={ css( { maxWidth: '48px', height: '48px', marginBottom: '4px' } ) }
				/>
			</div>
			<div className="rewind-flow__title">
				<LoadingPlaceholder className={ css( { height: '36px' } ) } />
			</div>
			<div className="rewind-flow__progress-bar">
				<div className="rewind-flow__progress-bar-header">
					<p className="rewind-flow__progress-bar-message">
						<LoadingPlaceholder className={ css( { minWidth: '210px', height: '24px' } ) } />
					</p>
					<p className="rewind-flow__progress-bar-percent">
						<LoadingPlaceholder className={ css( { minWidth: '86px', height: '24px' } ) } />
					</p>
				</div>
				<LoadingPlaceholder className={ css( { height: '9px' } ) } />
			</div>
			<p className="rewind-flow__info">
				<LoadingPlaceholder className={ css( { height: '24px' } ) } />
			</p>
			<div className="rewind-flow-notice">
				<LoadingPlaceholder className={ css( { minWidth: '100%', height: '88px' } ) } />
			</div>
		</>
	);
};

export default GranularRestoreLoading;
