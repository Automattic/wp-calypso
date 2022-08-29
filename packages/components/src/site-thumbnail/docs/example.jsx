import WordPressLogo from '../../wordpress-logo';
import { SiteThumbnail } from '../index';

const ASPECT_RATIO = 16 / 11;
const THUMBNAIL_DIMENSION = {
	width: 401,
	height: 401 / ASPECT_RATIO,
};

export default function SiteThumbnailExample() {
	return (
		<div>
			<h2>Small</h2>
			<div
				style={ {
					display: 'inline-grid',
					gridTemplateColumns: '1fr 1fr',
					columnGap: '16px',
					rowGap: '16px',
				} }
			>
				<div
					style={ {
						backgroundColor: 'white',
						width: '300px',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Public Site</h3>
					<SiteThumbnail mShotsUrl="https://wpvip.com" />
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						width: '300px',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Private Site with Site Icon</h3>
					<SiteThumbnail backgroundColor="purple">
						<div style={ { paddingTop: '25px' } }>
							<WordPressLogo size={ 36 } />
						</div>
					</SiteThumbnail>
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						width: '300px',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Private Site without Site Icon and Light Background</h3>
					<SiteThumbnail backgroundColor="#008B8B">WP</SiteThumbnail>
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						width: '300px',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Coming Soon Site</h3>
					<SiteThumbnail>CS</SiteThumbnail>
				</div>
			</div>
			<h2>Medium</h2>
			<div
				style={ {
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					columnGap: '16px',
					rowGap: '16px',
				} }
			>
				<div
					style={ {
						backgroundColor: 'white',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Public Site</h3>
					<SiteThumbnail { ...THUMBNAIL_DIMENSION } mShotsUrl="https://wpvip.com" />
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Private Site with Site Icon</h3>
					<SiteThumbnail { ...THUMBNAIL_DIMENSION } backgroundColor="cyan">
						<div style={ { paddingTop: '25px' } }>
							<WordPressLogo />
						</div>
					</SiteThumbnail>
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Private Site without Site Icon and Light Background</h3>
					<SiteThumbnail { ...THUMBNAIL_DIMENSION } backgroundColor="#BABABA">
						W
					</SiteThumbnail>
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Coming Soon Site</h3>
					<SiteThumbnail
						dimension={ { width: 400, height: 275 } }
						dimensionsSrcset={ [
							{
								width: 200,
								height: 137,
							},
						] }
						sizesAttr="(max-width: 400px) 100vw, 400px"
					>
						CS
					</SiteThumbnail>
				</div>
			</div>
		</div>
	);
}
