import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  privateKey: process.env['IMAGEKIT_SECRET'], // This is the default and can be omitted
});

export default imagekit

