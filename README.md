# 区块链原理与技术期末项目
**Author: Liang Junhua**
**Email: liangjh45@mail2.sysu.edu.cn**

## 项目运行注意事项

项目使用的操作系统为**mac OS**，为确保项目的正常运行，请使用mac OS<br>
运行时需要进入DApp目录开启两个终端：
第一个终端运行：
```
  > ganache-cli -e 3001 -l 99999999999999 -g 20000
```
第二个终端运行：
```
  > truffle compile --all
  > truffle migrate --reset
  > npm run dev
```
请确保已安装ganache和truffle，相应版本在实验报告中也会有所说明

项目删除了node_modules，需要自行运行下面命令安装相应的模块:

```
npm install
```

如果运行完后仍然缺乏部分modules，需自行用npm进行安装

