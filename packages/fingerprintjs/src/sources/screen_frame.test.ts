import { withMockProperties } from '../../tests/utils';
import * as screenFrame from './screen_frame';

describe( 'Sources', () => {
	describe( 'screenFrame', () => {
		beforeEach( () => {
			screenFrame.resetScreenFrameWatch();
		} );

		it( 'gets non-zero frame', async () => {
			await withMockProperties(
				screen,
				{
					width: { get: () => 1440 },
					height: { get: () => 900 },
					availWidth: { get: () => 1367 },
					availHeight: { get: () => 853 },
					availLeft: { get: () => 49 },
					availTop: { get: () => 11 },
				},
				async () => {
					const frame = await screenFrame.getScreenFrame()();
					expect( frame ).toEqual( [ 11, 24, 36, 49 ] );

					const roundedFrame = await screenFrame.getRoundedScreenFrame()();
					expect( roundedFrame ).toEqual( [ 10, 20, 40, 50 ] );
				}
			);
		} );

		it( 'gets null frame', async () => {
			await withMockProperties(
				screen,
				{
					width: { get: () => 1920 },
					height: { get: () => 1080 },
					availWidth: { get: () => 1920 },
					availHeight: { get: () => 1080 },
					availLeft: { get: () => 0 },
					availTop: { get: () => 0 },
				},
				async () => {
					const frame = await screenFrame.getScreenFrame()();
					expect( frame ).toEqual( [ 0, 0, 0, 0 ] );

					const roundedFrame = await screenFrame.getRoundedScreenFrame()();
					expect( roundedFrame ).toEqual( [ 0, 0, 0, 0 ] );
				}
			);
		} );

		it( 'gets frame with unavailable position (IE and Edge ≤18)', async () => {
			await withMockProperties(
				screen,
				{
					width: { get: () => 1280 },
					height: { get: () => 1024 },
					availWidth: { get: () => 1182 },
					availHeight: { get: () => 1000 },
					availLeft: { get: () => undefined },
					availTop: { get: () => undefined },
				},
				async () => {
					const frame = await screenFrame.getScreenFrame()();
					expect( frame ).toEqual( [ null, 98, 24, null ] );

					const roundedFrame = await screenFrame.getRoundedScreenFrame()();
					expect( roundedFrame ).toEqual( [ null, 100, 20, null ] );
				}
			);
		} );

		it( 'watches for screen frame', async () => {
			try {
				jasmine.clock().install();
				jasmine.clock().mockDate();

				let screenFrameGetter: () => Promise< screenFrame.FrameSize >;

				await withMockProperties(
					screen,
					{
						width: { get: () => 640 },
						height: { get: () => 480 },
						availWidth: { get: () => 640 },
						availHeight: { get: () => 480 },
						availLeft: { get: () => 0 },
						availTop: { get: () => 0 },
					},
					async () => {
						screenFrameGetter = screenFrame.getScreenFrame();

						// The screen frame is null now
						const frame = await screenFrameGetter();
						expect( frame ).toEqual( [ 0, 0, 0, 0 ] );
					}
				);

				await withMockProperties(
					screen,
					{
						width: { get: () => 640 },
						height: { get: () => 480 },
						availWidth: { get: () => 600 },
						availHeight: { get: () => 400 },
						availLeft: { get: () => 10 },
						availTop: { get: () => 30 },
					},
					async () => {
						// The screen frame has become non-null, the frame watch shall remember it
						jasmine.clock().tick( screenFrame.screenFrameCheckInterval );
					}
				);

				await withMockProperties(
					screen,
					{
						width: { get: () => 640 },
						height: { get: () => 480 },
						availWidth: { get: () => 640 },
						availHeight: { get: () => 480 },
						availLeft: { get: () => 0 },
						availTop: { get: () => 0 },
					},
					async () => {
						// The screen frame has become null again, `getScreenFrame` shall return the remembered non-null frame
						jasmine.clock().tick( screenFrame.screenFrameCheckInterval );
						const frame = await screenFrameGetter();
						expect( frame ).toEqual( [ 30, 30, 50, 10 ] );
					}
				);

				await withMockProperties(
					screen,
					{
						width: { get: () => 640 },
						height: { get: () => 480 },
						availWidth: { get: () => 600 },
						availHeight: { get: () => 400 },
						availLeft: { get: () => 30 },
						availTop: { get: () => 10 },
					},
					async () => {
						// The screen frame has become non-null, `getScreenFrame` shall return the new size and remember it
						jasmine.clock().tick( screenFrame.screenFrameCheckInterval );
						const frame = await screenFrameGetter();
						expect( frame ).toEqual( [ 10, 10, 70, 30 ] );
					}
				);

				await withMockProperties(
					screen,
					{
						width: { get: () => 640 },
						height: { get: () => 480 },
						availWidth: { get: () => 640 },
						availHeight: { get: () => 480 },
						availLeft: { get: () => 0 },
						availTop: { get: () => 0 },
					},
					async () => {
						// The screen frame has become null again, `getScreenFrame` shall return the new non-null frame
						jasmine.clock().tick( screenFrame.screenFrameCheckInterval );
						const frame = await screenFrameGetter();
						expect( frame ).toEqual( [ 10, 10, 70, 30 ] );
					}
				);
			} finally {
				jasmine.clock().uninstall();
			}
		} );

		it( 'returns stable values', async () => {
			const first = screenFrame.getRoundedScreenFrame();
			const second = screenFrame.getRoundedScreenFrame();

			expect( await second() ).toEqual( await first() );
		} );
	} );
} );
