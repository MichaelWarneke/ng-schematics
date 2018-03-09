#build 

tsc -p tsconfig.json
rm -rf build
mkdir build
mkdir build/@tmp
mkdir build/@tmp/schematics
rsync -a --include=*/files/**/*.ts --exclude=*.ts src/ build/@tmp/schematics
