
echo Install patched ngrx schematics
rm -rf node_modules/@tmp/ngrx
rm -rf tmp-schematics
mkdir tmp-schematics 
cd tmp-schematics; git init
git remote add -f origin https://github.com/MichaelWarneke/platform
git pull --depth=1 origin master
yarn
yarn build
mkdir ../node_modules/@tmp
mkdir ../node_modules/@tmp/ngrx
cp -i -r dist/schematics ../node_modules/@tmp/ngrx/schematics
cd ..
rm -rf tmp-schematics

echo Install patched nx schematics
rm -rf node_modules/@tmp/nrwl
rm -rf tmp-schematics
mkdir tmp-schematics 
cd tmp-schematics; git init
git remote add -f origin https://github.com/MichaelWarneke/nx
git pull --depth=1 origin master
yarn
yarn build
mkdir ../node_modules/@tmp
mkdir ../node_modules/@tmp/nrwl
cp -i -r build/packages/schematics ../node_modules/@tmp/nrwl/schematics
cp -i -r build/packages/shared ../node_modules/@tmp/nrwl/shared
cd ..
rm -rf tmp-schematics
