#build 
rm -rf build

tsc -p tsconfig.json

rsync -a --include=*/files/**/*.ts --include=**.d.ts --exclude=*.ts src/ build
cp LICENSE build
cp README.md build