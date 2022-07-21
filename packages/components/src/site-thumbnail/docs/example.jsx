import { SiteThumbnail } from '../index';

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
					<SiteThumbnail />
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
					<SiteThumbnail />
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
					<SiteThumbnail size="medium" mShotsUrl="https://wpvip.com" />
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Private Site with Site Icon</h3>
					<SiteThumbnail size="medium" />
				</div>
				<div
					style={ {
						backgroundColor: 'white',
						border: '1px solid lightgray',
						padding: '16px',
					} }
				>
					<h3>Private Site without Site Icon and Light Background</h3>
					<SiteThumbnail size="medium" backgroundColor="#BABABA">
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
					<SiteThumbnail size="medium" />
				</div>
			</div>
		</div>
	);
}
