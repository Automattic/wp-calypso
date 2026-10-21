export type ReaderThumbnailService = 'youtube' | 'videopress' | 'vimeo' | 'pocketcasts';

export interface ReaderThumbnailEmbed {
	service: ReaderThumbnailService;
	id: string;
}
